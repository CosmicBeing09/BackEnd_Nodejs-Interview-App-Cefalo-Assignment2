const shortid = require('shortid');
const users = [];
const roomData = [];

const addUser = ({id, name, room, role, key}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    role = role.trim().toLowerCase();
    

    const existingUser = users.find((user) => user.name === name && user.room === room);

    if(existingUser){
        return { 
            error : 'Username already taken'
        }
    }

    
    if(role === 'contastant'){
    const existingContastant = users.find((user) => user.role === 'contastant' && user.room === room);

    if(existingContastant){
        return { 
            error : 'Contastant already joined!'
        }
    }
}
    
    if(role === 'admin'){
      const roomExist = roomData.find((user) => user.room === room);
      if(roomExist){
        return { 
            error : 'Room already created with the same name!!'
        } 
      }
      const key = shortid.generate();
      const user = {id, name , room, role, key};
      users.push(user);
      const roomDatum = {name, room, key};
      roomData.push(roomDatum);
      return {user};
    }

    const isAuthenticated = roomData.find((data) => data.room === room && data.key === key);
    
    if(!isAuthenticated){
        return { 
            error : 'Wrong room credentials!!'
        }
    }

    const user = {id, name , room, role};
    users.push(user);

    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) return users.splice(index, 1)[0];
};

const removeRoomData = (name,room) => {
    const index = roomData.findIndex((user) => user.name === name && user.room === room);
    if(index !== -1) return roomData.splice(index, 1)[0];
};


const getUser = (id) => { 
    return users.find((user) => user.id === id)
};

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, getUser , getUsersInRoom, removeUser,removeRoomData};