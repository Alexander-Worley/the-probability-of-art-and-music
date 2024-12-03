**The Probability of Art and Music\!**  
**By: Alexander Worley**

Play with the project here: 

* This project was originally intended to be an exploration into creating art and music from probability distributions.

## The initial idea:

* What would art look like, and what would music sound like, if it was created purely from probability distributions?  
  * This was built off of the idea that was introduced in one of the Problem Sets about creating algorithmic art.

## How I went about creating this:

* First, I created a few different distributions (Binomial, Poisson, and Normal) and pulled random values from them.  
* Then, I would take those values and plot them to random points on a canvas based on some pattern.  
  * First, I placed them on the center but with different sizes depending on what values were pulled from the distribution.  
  * Then, I pulled two values to determine the x and y coordinates of the circle.  
  * Then, I experimented with spirals.

## For the music:

* First, I defined a few select notes that could be played.  
* Then, a random value would be pulled from the distribution selected.  
* That value would then be compared to the other possible values that the distribution could generate.  
  * If it is the lowest possible value, then the lowest possible note is played.  
  * If it’s in the 33 percentile, then the note 1/3 of the way up would be played.

## The issues I faced:

* I don’t know JavaScript, HTML, or CSS, but I really, really wanted the application to be usable in a browser\!  
* Therefore, I spent a lot of time using ChatGPT to help me translate my ideas and fragmented code from what little JavaScript, HTML, and CSS I knew into something usable.  
* Unfortunately, ChatGPT struggles with writing a lot of code, and my knowledge only took me so far.  
* As such, there are some bugs in the program that I have been unable to fix, and ChatGPT has also been unable to fix :(

## The addition of Bayesian Reasoning:

* After my initial ideas were mostly working, I wanted to take it one step further.  
* For the music part specifically, picking random notes doesn’t make for very appealing music – especially when multiple distributions are being used at once.  
* Introducing: Bayesian Reasoning\! In music theory, you can generally predict what notes will come next in a song given the previous notes.  
* As such, I wanted to devise a system in which (instead of pulling random notes from the distributions), the notes would instead be chosen based on the previous notes\!

## What I would add if I had more time:

* Honestly, I would love to just flesh out all of the ideas I attempted with this project so that they are more polished and complete.  
* I enjoyed the music part much more than the art, and I would love more time to make the music portion significantly better – even if it means I have to drop the art portion.

## What I would do differently if I did this project again:

* I would only focus on one thing\!  
* Focusing on art AND music AND Bayesian Reasoning strained me too much given the time I had to work on this project.  
* If I did this project again, I would instead just focus on one part (probably using Bayesian Reasoning to generate a song given some notes) and polish it much, much more.
