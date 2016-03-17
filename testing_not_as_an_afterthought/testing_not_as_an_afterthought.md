# Testing not as an afterthought

Alternative title: __Examples, guides, and tutorials with tests, please!__

This post is about frameworks, and my frustration with figuring out how to build something not just functional, but also testable. Written with some web and frontend frameworks in mind.


## Getting started

When learning a framework you'll typically read and reference their documents, examples, guides, and tutorials in order to understand it and eventually achieve some goal. Assuming it's even remotely popular, you'll typically find plentiful resources.

You'll most likely hack together something that works, all while figuring out and developing an understanding of the patterns and concepts which are presented.

Based on my experience, whatever you're making, the first couple times will probably suck in many ways. But it works! Which is great, because software development is an iterative process.

> Dude, suckin' at somethin' is the first step towards bein' sorta good at somethin'.
>
> <cite>Jake the Dog, Adventure Time</cite>


## Leveling up

You've tinkered with demos and done some tutorials. Now you have a feel for how the framework works, and the features it provides. At least for me, this is the point where I'll look into testing, and thus complications will arise.

I'm unsure if I've simply had unfortunate experiences, but it seems like for all the resources that are available for some frameworks, there's very little in the way of testing. That is, understanding _how_ and _what_ to test, as well as writing code that enables this.

What bothers me is that in order to make concepts simpler to understand, you're typically presented with terrible examples, which are completely nonsensical for actual usage. With the real problem being that there's no follow-up saying: now that you understand the concept, this is how you should actually be using this.


## My humble request

My wishlist, for framework developers and for people writing tutorials and guides:

* More realistic examples, _with tests_. Sorry, TodoMVC is not good enough.
* Don't just explain what a feature does, explain when and how to use it, what it's good for.
* Examples that highlight multiple features, along with how to test them and their interactions.
* Give examples for your suggested patterns. Don't call things out as anti-patterns without providing alternatives with examples.

At the very least, if you're giving a conceptual example that uses anti-patterns, let the reader know. Even better, if possible, tell them where they can go find more complete examples.
