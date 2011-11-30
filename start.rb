require "rubygems"
require "sinatra"
require "evernote"
require "json"

get "/" do
  erb :login
end

post "/login" do
  Evernote.login(params["username"], params["password"]).to_json
end

get "/piano" do
  erb :piano
end

get "/sheet_music/:notes" do
  erb :sheet_music, :locals => params
end

get "/notebooks" do
  Evernote.get_notebooks(params["username"]).to_json
end

post "/create_note" do
  Evernote.create_note(params)
end