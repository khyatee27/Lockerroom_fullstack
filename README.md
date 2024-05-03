# Lockerroom_fullstack
react front end and express node Postgresql backend Chat full stack application

/api/register	                POST		    email, and a password	        A message stating the user has been created (or the approriate error, if any)
/api/login	                  POST		    email & password	            A JSON Web Token/session ID (or the approriate error, if any)
/api/lobby/[lobby-id]	        GET		-                                	  An array containing all the message from the lobby
/api/lobby/[lobby-id]/
[message-id]	                GET	         Message-id	                  A single message object from the lobby
/api/lobby/[lobby-id]        	POST	An object containing the message	  A message stating the message has been posted (or the approriate error, if any)
/api/users	                  GET	                                    	All the users from the same lobby
/api/users/[user-id]	        GET	  	A single user.                     If the user is not an admin, can only get details from people that are in the same lobby.
/api/lobby/[lobby-id]/
add-user	                    POST		                                    The user to add to the lobby	Add an user to a lobby

Backend done:
•	APIs are tested with postman.
•	Heroku deployment is done.
•	All tables are created at Heroku server.
•	All Apis tested with Heroku server database. Working correctly.
	
 Frontend done & pending list:
•	Sign up/Sign In/Message component created
•	Validations are done
•	Database connected through frontend

Pending : 
Fetch Apis having errors  to connect front end & backend
Need to fix it to load data.
Fetch messages.
Add user is pending
