app = Proc.new do |env|
    [ 200, {'Content-Type' => 'text/plain'},
      env.each.map {|k,v| "#{k}=#{v}\n"}.collect ]
end
run app