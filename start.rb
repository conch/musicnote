require "rubygems"
require "sinatra"

get "/" do
  erb :piano
end

get "/sheet_music/:notes" do
  erb :sheet_music, :locals => params
end