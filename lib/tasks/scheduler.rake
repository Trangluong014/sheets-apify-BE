desc "This task is called by the Heroku scheduler add-on"
task :check_dblastupdate => :environment do
  puts "Updating feed..."
  NewsFeed.update
  puts "done."
end

