dir = File.expand_path(File.dirname(__FILE__))
$LOAD_PATH.push("#{dir}/evernote")
$LOAD_PATH.push("#{dir}/evernote/Evernote/EDAM")

require "auth_secrets.rb"
require "json"
require "digest/md5"
require "base64"
require "htmlentities"

require "thrift/types"
require "thrift/struct"
require "thrift/protocol/base_protocol"
require "thrift/protocol/binary_protocol"
require "thrift/transport/base_transport"
require "thrift/transport/http_client_transport"
require "Evernote/EDAM/user_store"
require "Evernote/EDAM/user_store_constants.rb"
require "Evernote/EDAM/note_store"
require "Evernote/EDAM/limits_constants.rb"

module Evernote
  AUTH_TOKENS = {} # keeps track of everyone who has logged on since the server turned on. maps usernames to tokens/expiration/note stores
  evernote_host = "evernote.com"
  user_store_url = "https://#{evernote_host}/edam/user"
  USER_STORE_URL_BASE = "https://#{evernote_host}/edam/note/"

  user_store_transport = Thrift::HTTPClientTransport.new(user_store_url)
  user_store_protocol = Thrift::BinaryProtocol.new(user_store_transport)
  USER_STORE = Evernote::EDAM::UserStore::UserStore::Client.new(user_store_protocol)

  def Evernote.login(u, p)
    consumer_key = CKEY
    consumer_secret = CSECRET
    username = u
    password = p

    begin
      auth_result = USER_STORE.authenticate(username, password, consumer_key, consumer_secret)
    rescue Evernote::EDAM::Error::EDAMUserException => ex
      return false
    end
    user = auth_result.user
    auth_token = auth_result.authenticationToken
    exp = auth_result.expiration
    note_store_url = USER_STORE_URL_BASE + user.shardId
    note_store_transport = Thrift::HTTPClientTransport.new(note_store_url)
    note_store_protocol = Thrift::BinaryProtocol.new(note_store_transport)
    note_store = Evernote::EDAM::NoteStore::NoteStore::Client.new(note_store_protocol)
    AUTH_TOKENS[u] = [auth_token, exp, note_store]
    return true
  end

  # check auth token for the user and refresh if it'll expire within 10 minutes
  def Evernote.refresh_auth_token(username)
    user_info = AUTH_TOKENS[username]
    auth_token = user_info[0]
    exp = user_info[1]
    note_store = user_info[2]

    if exp < Time.now.to_i + 10 * 60
      auth_result = USER_STORE.refreshAuthentication auth_token
      auth_token = auth_result.authenticationToken
      exp = auth_result.expiration
      AUTH_TOKENS[username] = [auth_token, exp, note_store]
    end
  end

  def Evernote.get_notebooks(username)
    refresh_auth_token username
    auth_token = AUTH_TOKENS[username][0]
    note_store = AUTH_TOKENS[username][2]
    # get notebooks
    notebooks = note_store.listNotebooks(auth_token)
    notebook_names = notebooks.map do |book|
      name = book.name
      if book.defaultNotebook
        name += " (default)"
      end
      [name, book.guid]
    end

    notebook_names.sort
  end

  def Evernote.create_note(params)
    username = params[:username]
    refresh_auth_token username
    auth_token = AUTH_TOKENS[username][0]
    note_store = AUTH_TOKENS[username][2]
    # assemble note
    title = params[:title]
    comments = HTMLEntities.new.encode params[:comments]
    base64 = params[:base64]
    tags = params[:tags].split(/\,+\s*/)
    notebookGuid = params[:notebookGuid]

    # decode base64 and turn into binary
    binary = Base64.decode64 base64
    # create md5 hash of binary
    hashHex = Digest::MD5.new.hexdigest(binary)
    data = Evernote::EDAM::Type::Data.new()
    data.bodyHash = hashHex
    data.body = binary
    resource = Evernote::EDAM::Type::Resource.new()
    resource.mime = "image/png"
    resource.data = data

    note = Evernote::EDAM::Type::Note.new()
    note.title = title
    note.content = "<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">" +
                    "<en-note>" +
                    "<pre>#{comments}</pre>" +
                    "<en-media type=\"image/png\" hash=\"" + hashHex + "\"/>" +
                    "</en-note>"
    note.notebookGuid = notebookGuid
    note.tagNames = tags
    note.resources = [resource]

    # actually create note in Evernote
    note_store.createNote(auth_token, note)
  end
end