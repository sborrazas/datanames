require 'sinatra/base'
require 'json'
require root_path('helpers/assets')

class App < Sinatra::Base

  helpers Helpers::Assets

  APP_DOMAIN = 'data.180.com.uy'

  configure do
    set :views, root_path('views')
    set :public_folder, root_path('public')
    set :static_cache_control, [:public, max_age: 60 * 60 * 24]
    set :environment, (ENV['RACK_ENV'] || 'development').to_sym

    set :app_domain, settings.development? ? /localhost/ : APP_DOMAIN

    enable :static
  end

  configure :production, :development do
    enable :logging
  end

  not_found do
    erb :'not_found.html'
  end

  get %r{/(?:nombre/([^/]+)(?:/(\d+))?)?$} do |main_name, year|
    if settings.app_domain === request.env['HTTP_HOST']
      cache_control :public, :must_revalidate, max_age: 60 * 60 * 24
      names = (params[:others] || '').split(',')
      names.unshift(main_name) if main_name
      erb(:'index.html', layout: :'layout.html', locals: {
        names: names.map(&:strip),
        main_name: main_name,
        year: year ? year.to_i : nil
      })
    else
      redirect("http://#{APP_DOMAIN}", 301)
    end
  end
end
