import React, { Children } from 'react'

export default function UserContext() {
    const [user, setUser] = React.useState({});
    const UserContext = React.createContext({ user, setUser });

    return (
        <UserContext.Provider value={{user, setUser}}>
            {Children}
        </UserContext.Provider>
    );
}
