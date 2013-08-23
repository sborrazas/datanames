module Helpers
  module Assets

    ASSETS_BASE_PATH = ''

    # Public: Determine the absolute path for the assets, given the relative
    # path.
    #
    # asset_relative_path - A String with the asset relative path.
    #
    # Returns a String with the asset absolute path.
    def asset_path(asset_relative_path)
      "#{ASSETS_BASE_PATH}/#{asset_relative_path}"
    end

    # Public: Determine the absolute path for a stylesheet, given the
    # stylesheet file path.
    #
    # stylsheet_filepath - A string with the stylesheet relative path.
    #
    # Returns a String with the stylesheet absolute path.
    def stylesheet_path(stylesheet_filepath)
      asset_path("stylesheets/#{stylesheet_filepath}")
    end

    # Public: determine the absolute path for a javascript, given the
    # javascript file path.
    #
    # stylsheet_filepath - A string with the javascript relative path.
    #
    # Returns a String with the javascript absolute path.
    def javascript_path(javascript_filepath)
      asset_path("javascripts/#{javascript_filepath}")
    end

 end
end
