import NavbarRoot from '@/_components/Navbar/NavbarRoot'
import React from 'react'

const layout = ({ children }) => {
    return (
        <div>
            <NavbarRoot/>
            {children}
        </div>
    )
}

export default layout
