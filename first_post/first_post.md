# First post!

Greetings. I've decided to build my own blogging engine. 

## Why?

Because the wheel isn't going to reinvent itself! What kind of silly question is that?

## What's so special about it?

My idea was originally just to make an entirely normal blog, like the ones currently out there. The only spin was that you'd write your posts in `Markdown`. Not really a big deal.

But as I was implementing it, I realized I'm extremely lazy. I decided I wanted to use [Disqus](https://disqus.com) for comments, so I wouldn't need users; I would only need an admin page. 

Then I kept thinking about it, and realized it's sort of silly to build in so many things into the app if users are only going to be able to access such a small part. So I said: alright, this should be two different apps! One for viewing the blog, and one for creating new blog posts. 

Eventually I decided I wanted to store all my blog posts in a git repository, and have the blog viewer just periodically fetch them. As of writing this I'm still building out the parts. I have the blog viewer finished, and the process for fetching the posts is almost done. Additionally, it includes some metadata, which I'm still figuring out, but should hopefully make the user experience nicer.

Then I'll have to build out an app that lets me write my posts and sends it to the repository. But Rome wasn't built in a day, so I'm going to take it slow. 
