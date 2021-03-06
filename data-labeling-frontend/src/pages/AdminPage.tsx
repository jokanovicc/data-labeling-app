import React from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ProjectTable } from '../components/ProjectTable'

export const AdminPage = () => {
  
  let counter = 0;
  const handler = () => {
    counter++;
    alert(`Hanlder called! Counter is: ${counter}`);

  }
  
  return (
    <>      
       <ProjectTable onResourceFilled={handler}/>
       <div style={{ textAlign: "center", marginTop:"50px"}}>
         <h5>Желите ли додати нови пројекат? </h5>
         <p></p>

         <Link to='/add-project'>
            <Button>Додај!</Button>
        </Link>
       </div>
    </>
    
  )
}
