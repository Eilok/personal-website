window.onload = function() {
    //initialize the program
    var program = new Eilok();
    program.init();
};

//define the class of Eilok
var Eilok = function() {
    this.socket = null;
};

//add methods to prototype
Eilok.prototype = {
    init: function() {  //initialize the program
        var that = this;
        //build a socket connection
        this.socket = io.connect();
        //listen connect event of socket
        this.socket.on('connect', function() {
            //when server is connected, display the login page
            document.querySelector(".bg-login").style.display = "block";
            document.getElementById("login-username").focus();
        });
        
        //login confirm button
        document.getElementById("login-submit").addEventListener('click', function() {
            var username = document.getElementById("login-username").value;
            //check if the username is null
            if (username.trim().length != 0) {
                //if not null, emit a login event to server
                that.socket.emit('login', username);
            }
            else {
                //if null, the input box get focused.
                document.getElementById("login-username").focus();
            };
        }, false);

        //tell user to change other nickname
        this.socket.on('nameExisted', function(){
            document.querySelector('.prompt').textContent = '*nickname is taken, please choose another.';
        });

        this.socket.on('loginSuccess', function() {
            document.title = 'Eilok world: '+document.getElementById("login-username").value + ' chat';
            document.querySelector('.bg-login').style.display = 'none'; //hide login page
            document.getElementById('input-field').focus();
        });

        
        this.socket.on('system', function(username, usersArr, type) {
            const users = JSON.parse(usersArr);   //parse the array
            //determine user's behaviour and display different message
            var msg = username + (type == 'login' ? ' joined the chat' : ' left the chat');
            var p = document.createElement('p');
            p.textContent = msg;
            document.querySelector(".chat-box").appendChild(p);
            p.classList.add('login-logout');
            //display the number of online user at the top of user list
            document.getElementById("user-number").textContent = users.length + (users.length > 1 ? ' users are' : ' user is') + " online";
            var userList = document.querySelector('.user-list');
            while (userList.children.length != 1) { //renew user list
                userList.removeChild(userList.lastChild);
            }
            for (var i of users) {
                var userArea = document.createElement('div');
                var userHead = document.createElement('img');
                var userName = document.createElement('p');
                userHead.src = "../images/communication/anonymous_user.svg";
                userName.textContent = i;
                userArea.appendChild(userHead);
                userArea.appendChild(userName);
                userList.appendChild(userArea);
                userArea.classList.add('user-area');
                userHead.classList.add('user-head');
                userName.classList.add('user-name');
            }
        });

        // click exit button to go back to the last page.
        document.querySelector('.exit').addEventListener("click", function() {
            window.history.back();
        });

        //handle user's message
        document.getElementById('send-btn').addEventListener('click', function() {
            var msgInput = document.getElementById('input-field');
            var msg = msgInput.value;
            msgInput.value = '';
            if (msg.trim().length != 0) {
                that.socket.emit('userMsg', msg); //send message to server
                that._sendNewMsg('me', msg, 'myself');    //display own message to own window
            };
        }, false);
        
        //display other message on the box
        this.socket.on('userMsg', function(user, msg, type) {
            that._sendNewMsg(user, msg, type);
        });

        //when one user is typing, announce other users
        document.getElementById('input-field').addEventListener('input', function() {
            that.socket.emit('typing');
        });

        //display typing hint
        this.socket.on('typing', function(username) {
            const allUserName = document.querySelectorAll(".user-name");
            
            for (var user of allUserName) {
                if (user.textContent === username && user.nextSibling == null) {
                    const userArea = user.parentNode;
                    const typeMsg = document.createElement('p');
                    typeMsg.textContent = 'Typing...';
                    userArea.appendChild(typeMsg);
                    typeMsg.classList.add('type-msg');
                }
            }
            
            
        });

        //when one user stop typing, announce other users
        document.getElementById('input-field').addEventListener('blur', function() {
            that.socket.emit('noTyping');
        });

        //delete typing hint
        this.socket.on('noTyping', function(username) {
            const allUserName = document.querySelectorAll(".user-name");
            
            for (var user of allUserName) {
                if (user.nextSibling != null) {
                    user.parentNode.removeChild(user.nextSibling);
                }
            }
        })

    },

    //a single function to handle user's message
    _sendNewMsg: function(user, msg, type) {
        var chatBox = document.querySelector('.chat-box');
        var msgPart = document.createElement('div');
        var msgHead = document.createElement('p');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substring(0, 8);
        msgHead.innerHTML = user + '<span class="timespan">(' + date + '): </span>';
        msgToDisplay.textContent = msg;
        msgPart.appendChild(msgHead);
        msgPart.appendChild(msgToDisplay);
        if (type === "myself") {    //own information
            msgPart.classList.add('own-msg');
            msgHead.classList.add('own-head');
            msgToDisplay.classList.add('own-display');
        }
        else {  //other user information
            msgPart.classList.add('other-msg');
            msgHead.classList.add('other-head');
            msgToDisplay.classList.add('other-display');
        };
        chatBox.appendChild(msgPart);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
};