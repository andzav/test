/////////LOGIN
axios.post('/api/users', {
    email: '<email>',
    password: '<password>'
})
.then(function (response) {
    localStorage.setItem('SID', response.SID);
    console.log(response); //phone permission trainer(True/False) rating email info fullname SID
})
.catch(function (error) {
    console.log(error);
});

////////Promoting to moderator/admin
axios.post('/api/users/promote', {
    SID: localStorage.getItem('SID'),
    promemail: '<email to promote>',
    perm: 'admin' //moderator/user/admin
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});

//////Get top 10 users
axios.get('/api/users/top')
.then(function (response) {
    console.log(response);  //Top 10 users Full Name + rating
})
.catch(function (error) {
    console.log(error);
});

//////Get specific user or trainers
axios.get('/api/users?email=test@test.com')   //or /api/users?trainer=true to get all trainers
.then(function (response) {
    console.log(response);  //Users ARRAY
})
.catch(function (error) {
    console.log(error);
});

/////GET SELECTED COURTS
axios.get('/api/courts?type=football&whs=8&whe=22&&rpf=10&&rpt=100&&x=50.300&&y=45.400&&region=Sviatoshun') //whs - working hours start, whe - end, rpf - rent price from, rpt - rent price to
.then(function (response) {                                                                                  //x-x coord, y - y coord
    console.log(response);  //Courts ARRAY
})
.catch(function (error) {
    console.log(error);
});

////////Adding court
axios.post('/api/courts', {
    SID: localStorage.getItem('SID'),
    location: {x:5, y:5},
    type: "tennis",
    region: "Sviatoshun",
    working_hours: {start: 8, end: 22},
    rent_price: 100,
    num_people: 10
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});

////////Update court
axios.put('/api/courts', {                         // SID and id is important, everything else optional
    SID: localStorage.getItem('SID'),
    id: 5,
    location: {x:5, y:5},
    type: "tennis",
    region: "Sviatoshun",
    working_hours: {start: 8, end: 22},
    rent_price: 100,
    num_people: 10
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});

////////Remove court
axios.delete('/api/courts', {
    SID: localStorage.getItem('SID'),
    id: 5,
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});

//EVENTS

/////GET SELECTED EVENTS
axios.get('/api/events?type=football&whs=8&whe=22&&rpf=10&&rpt=100&&x=50.300&&y=45.400&&region=Sviatoshun&sh=all') //whs - working hours start, whe - end, rpf - rent price from, rpt - rent price to
.then(function (response) {                                                                                  //x-x coord, y - y coord, code - code for hidden, sh:all - show past events
    console.log(response);  //Events ARRAY
})
.catch(function (error) {
    console.log(error);
});

//ADD EVENT
axios.post('/api/events', {
    SID: localStorage.getItem('SID'),
    date: { "start": "9-31-2017", "end": "10-1-2017"},
    participants: ["kkk@ddd.lll", "ttt@lll.bbb"],
    courtID: 5,
    code: "123123", //optional
    entry_fee: 4 //optional
})
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });

//JOIN EVENT
axios.post('/api/events/join', {
    SID: localStorage.getItem('SID'),
    eventID: 5,
    code: 4 //optional
})
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });


//SUBMIT RESULT FOR EVENT
axios.post('/api/events/submitResult', {
    SID: localStorage.getItem('SID'),
    eventID: 5,
    score1: 4,
    score2: 6
})
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });

