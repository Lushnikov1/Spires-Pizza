const UserDto = (obj) =>{
    const {
        userId,
        userName,
        bonuses
    } = obj
    return {
        userId,
        userName,
        bonuses
    }
}

export default UserDto