# educounsel
Full stack multiportal website for an education counselling business 

# Demo link
I have used the cdn link because nest is not working (you can see the #nest channel ive posted my error there). I am very tired and so I used a quick screen recording to show the basic functionality of the website. 

# Some description
I have used supabase for the backend along with the react router template that I built upon for the backend. I did not have any time to make the frontend fall themed. 
The goal was(is) to make a website with multiple portals: a student portal where students can set their test dates, upload essays, message their counsellors, etc; a counsellors dashboard where they can view the students test dates, review essays and message them back, etc; A school dashboard for partner schools to observe some general metrics (test dates, total students, acceptances, etc) and finally the admin dashboard to manage all of this. My student dashboard frontend is the one thats most functional. 
In the 20 hours I've spent, I've only managed to get the backend fully working (the database connections, schemas, routes) and the frontend is pretty janky. Please take into consideration the entire scope of the project and how much of an undertaking it was to complete in 1 week before judging!

# Run the code

Start backend

```
cd backend
pnpm install
pnpm dev
```

Start frontend
```
cd frontend
npx http-server -p 5173
```

Navigate to http://127.0.0.1:5173

# AI Usage
I have used a bit over 30% of AI but thats because the code was getting really hard to navigate and there is alot more of copy pasting (routes, controllers, schemas) than actual business logic. I have done 22 hours of coding but the frontend is still kinda janky and doesn't work that great with the backend. The backend api works pretty flawlessly however as far as I've tested. Apart from the hours coding alot of the time also went into designing the schemas and the logic for the flow of the entire website. This is why I believe that the strictly 30% AI checking should be a bit more lenient on me, I am fully willing to take the hit on the reviewer bonus and coins but please do not outright reject the project, there has been alot of effort still been put into this project. If I really vibecoded the whole thing it would not have taken 20 hours and/or still be this broken. The project was just far beyond my scope and capabilities and I can't have done this on my own in 1 week. Please be lenient with the checking :(