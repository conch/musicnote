dir = File.expand_path(File.dirname(__FILE__))
$LOAD_PATH.push("#{dir}/evernote")
$LOAD_PATH.push("#{dir}/evernote/Evernote/EDAM")

require "auth_secrets.rb"
require "json"
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
  AUTH_TOKENS = {}
  evernote_host = "sandbox.evernote.com"
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
    AUTH_TOKENS[u] = [auth_token, user, exp]
    return true
  end

  def Evernote.get_notebooks(username)
    # check auth token for the user and refresh if it'll expire within 10 minutes
    user_info = AUTH_TOKENS[username]
    auth_token = user_info[0]
    user = user_info[1]
    exp = user_info[2]

    if exp < Time.now.to_i + 10 * 60
      auth_result = USER_STORE.refreshAuthentication auth_token
      user = auth_result.user
      auth_token = auth_result.authenticationToken
      exp = auth_result.expiration
      AUTH_TOKENS[username] = [auth_token, user, exp]
    end

    # get notebooks
    note_store_url = USER_STORE_URL_BASE + user.shardId
    note_store_transport = Thrift::HTTPClientTransport.new(note_store_url)
    note_store_protocol = Thrift::BinaryProtocol.new(note_store_transport)
    note_store = Evernote::EDAM::NoteStore::NoteStore::Client.new(note_store_protocol)

    notebooks = note_store.listNotebooks(auth_token)
    notebook_names = notebooks.map do |book|
      name = book.name
      if book.defaultNotebook
        name += " (default)"
      end
      [name, book.guid]
    end

    notebook_names.sort.to_json
  end
end