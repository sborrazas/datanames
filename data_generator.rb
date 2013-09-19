require 'csv'
require 'json'

module Datanames
  module Data

    DATA_FILE = root_path('data/nombre_nacim_por_anio_y_sexo.csv')
    TOP_NAMES_PER_YEAR_SIZE = 6

    #
    #
    #
    def self.extract_data
      names = Hash.new { |h, k| h[k] = [] }
      years = Hash.new { |h, k| h[k] = { f: [], m: [] } }

      # CSV columns
      #   0: Year
      #   1: Gender
      #   2: Name
      #   3: Quantity
      CSV.foreach(DATA_FILE) do |row|
        name = format_name(row[2])
        year = row[0].to_i
        quantity = row[3].to_i
        gender = case row[1]
                 when 'Femenino' then :f
                 when 'Masculino' then :m
                 else raise "Invalid gender: #{row[1].inspect}"
                 end

        current_name_data = names[name].find { |nd| nd[:year] == year }
        if current_name_data
          current_name_data[:quantity] += quantity
        else
          names[name] << { quantity: quantity, year: year }
        end

        year_data = years[year][gender]
        if year_data.size < TOP_NAMES_PER_YEAR_SIZE
          year_data << { name: name, quantity: quantity }
        else
          lowest_name = year_data.shift
          if lowest_name[:quantity] < quantity
            year_data.push({ name: name, quantity: quantity })
          else
            year_data.push(lowest_name)
          end
        end
        year_data.sort_by! { |name| name[:quantity] }
      end

      return [names, years]
    end

    #
    #
    #
    def self.export_data
      names, years = extract_data

      names_folder = root_path('public', 'names')
      names.each do |name, name_data|
        File.open(File.join(names_folder, "#{name}.json"), 'w') do |file|
          file.write(JSON.generate(name_data))
        end
      end

      years_folder = root_path('public', 'years')
      years.each do |year, year_data|
        File.open(File.join(years_folder, "#{year}.json"), 'w') do |file|
          file.write(JSON.generate(year_data))
        end
      end
    end

    #
    #
    #
    def self.format_name(name)
      name.strip.downcase.gsub(/ /, '_').gsub(/_de_los$|_del$|_de_la$|_de$/, '')
    end

  end
end
