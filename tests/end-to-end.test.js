const request = require('supertest');
const app = require('../app');

const note1Body = "This is a test note one";
const note2Body = "This is a test note two";
const note1BodyUpdated = "This is a test note one updated";

// create random text
const randomText = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

let user1 = {
  name : randomText(),
  password : "123"
}, user2 = {
  name : randomText(),
  password : "123"
}, user1Token, user2Token, user1Id, user2Id;

let note1Id, note2Id;

describe('Creating Users', () => {
  it("Should create user1", async ()=> {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name : user1.name,
        password : user1.password
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
  });

  it("Should create user 2", async ()=> {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name : user2.name,
        password : user2.password
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
  });
  
});

describe('Login Users', () => {
  it("Should login user1", async ()=> {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        name : user1.name,
        password : user1.password
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    res.headers['set-cookie'].forEach((cookie) => {
      if(cookie.startsWith('token=')){
        user1Token = cookie.split(';')[0].split('=')[1];
      }
    });
    user1Id = res.body.data._id;
  });

  it("Should login user2", async ()=> {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        name : user2.name,
        password : user2.password
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    res.headers['set-cookie'].forEach((cookie) => {
      if(cookie.startsWith('token=')){
        user2Token = cookie.split(';')[0].split('=')[1];
      }
    });
    user2Id = res.body.data._id;
  });

});

describe('Creating Notes', () => {
  it("Should create note1", async ()=> {
    const res = await request(app)
      .post('/api/notes')
      .set('Cookie', [`token=${user1Token}`])
      .send({
        body : note1Body
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    note1Id = res.body.data._id;
  });

  it("Should create note2", async ()=> {
    const res = await request(app)
      .post('/api/notes')
      .set('Cookie', [`token=${user1Token}`])
      .send({
        body : note2Body
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    note2Id = res.body.data._id;
  });

  it("Should Throw authentication error since jsonwebtoken not attached", async ()=> {
    const res = await request(app)
      .post('/api/notes')
      .send({
        body : note1Body
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });
  
});

describe('Getting Notes', ()=> {
  it("Should get all notes of user1", async ()=> {
    const res = await request(app)
      .get('/api/notes')
      .set('Cookie', [`token=${user1Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.length).toEqual(2);
  });
  
});

describe("Updating Notes", ()=> {
  it("Should update note1", async ()=> {
    const res = await request(app)
      .put(`/api/notes/${note1Id}`)
      .set('Cookie', [`token=${user1Token}`])
      .send({
        body : note1BodyUpdated
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("Should throw error since note1 does not belong to user2", async ()=> {
    const res = await request(app)
      .put(`/api/notes/${note1Id}`)
      .set('Cookie', [`token=${user2Token}`])
      .send({
        body : note1BodyUpdated
      });
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toEqual(false);
  });

});

describe("Getting a single note", ()=> {
  it("Should get note1", async ()=> {
    const res = await request(app)
      .get(`/api/notes/${note1Id}`)
      .set('Cookie', [`token=${user1Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.body).toEqual(note1BodyUpdated);
  });

  it("Should throw error since note1 does not belong to user2", async ()=> {
    const res = await request(app)
      .get(`/api/notes/${note1Id}`)
      .set('Cookie', [`token=${user2Token}`]);
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

});

describe("Sharing a note", ()=> {
  it("Should share note2 with user2 by user1", async ()=> {
    const res = await request(app)
      .post(`/api/notes/${note2Id}/share`)
      .set('Cookie', [`token=${user1Token}`])
      .send({
        sharedToId : user2Id
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

  });

  it("Should show message that note2 already shared", async ()=> {
    const res = await request(app)
      .post(`/api/notes/${note2Id}/share`)
      .set('Cookie', [`token=${user1Token}`])
      .send({
        sharedToId : user2Id
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toEqual("Note already shared to this user");
  });

  it("Should get note2 by user2, since it is shared now", async ()=> {
    const res = await request(app)
      .get(`/api/notes/${note2Id}`)
      .set('Cookie', [`token=${user2Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.body).toEqual(note2Body);
  });
});


describe("Searching through notes", ()=> {
  it("Should search for keyword \"note\"", async ()=> {
    const res = await request(app)
      .get(`/api/search?q=note`)
      .set('Cookie', [`token=${user1Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.length).toEqual(2);
  });

});

describe("Deleting a note", ()=> {
  it("Should delete note1", async ()=> {
    const res = await request(app)
      .delete(`/api/notes/${note1Id}`)
      .set('Cookie', [`token=${user1Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("Should delete note2", async ()=> {
    const res = await request(app)
      .delete(`/api/notes/${note2Id}`)
      .set('Cookie', [`token=${user1Token}`]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
  
  it("Should throw 404 since note2 is deleted", async ()=> {
    const res = await request(app)
      .delete(`/api/notes/${note2Id}`)
      .set('Cookie', [`token=${user2Token}`]);
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toEqual(false);
  });

});

