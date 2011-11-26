require "rubygems"
require "sinatra"

get "/" do
  erb :piano
end

get "/sheet_music" do
  erb :sheet_music
end