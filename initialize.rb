# Project files helpers
def root_path(*args)
  File.join(File.dirname(__FILE__), *args)
end

require 'rubygems'
require 'bundler'

ENV['BUNDLE_GEMFILE'] = root_path('Gemfile')
Bundler.require

require root_path('app')
