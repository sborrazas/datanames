require 'sinatra/base'
require 'json'
require root_path('helpers/assets')

class App < Sinatra::Base

  helpers Helpers::Assets

  configure do
    set :views, root_path('views')
    set :public_folder, root_path('public')
    set :static_cache_control, [:public, max_age: 60 * 60 * 24]
    set :environment, ENV['RACK_ENV'] || 'development'

    enable :static
  end

  configure :production, :development do
    enable :logging
  end

  not_found do
    erb :'not_found.html'
  end

  get '/' do
    cache_control :public, :must_revalidate, max_age: 60 * 60 * 24
    erb :'index.html', layout: :'layout.html'
  end
end
