import React, { useState } from 'react'
import { Button, Col, Container, Form, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { ProjectService } from '../services/ProjectService';


export interface MetadataTemplate{

  name: string;
  type: string;

}


export const AddMetadata = () => {

  const [metadata, setMetadata] = useState<MetadataTemplate>({

    name: "",
    type : ""

  });

  const [metadataList, setMetadataList] = useState<any[]>([]);

  const {id} = useParams();

  const cleanFields = () =>{
    setMetadata({
      name: "",
      type : ""
    })
  }



  const handleFormInputChange=(name:any)=>(event:any)=>{
    const val = event.target.value;
    setMetadata({ ...metadata, [name]: val });
  }

  const sendRequest = async () => {
    if(metadata.name !== "" && metadata.type !== ""){
      const newList = metadataList.concat(metadata);
      setMetadataList(newList);
      await ProjectService.addMetadataToProject(id, metadata);
      cleanFields();


    }else{
      alert("Polja nisu uredu!")
  }
}




  return (
    <>
    <Container>
        <Col md = {{span:6, offset:3}} style={{textAlign:"center"}}>
          <h2>Додавање метаподатка за пројекат</h2>
          <Form>
            <Form.Group>
              <Form.Label>Назив метаподатка</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={metadata.name}
                onChange={handleFormInputChange("name")}
              
              
              />
            </Form.Group>

            <Form.Label>Тип подататка</Form.Label>

            <Form.Group style={{marginBottom:"20px"}}>
              <Form.Select value={metadata.type} onChange={handleFormInputChange("type")}>
                <option value="">Отвори за селекцију</option>
                <option value="text">STRING</option>
                <option value="text">NUMBER</option>
                <option value="checkbox">BOOLEAN</option>
              </Form.Select>
            </Form.Group>



          </Form>



          <Table bordered striped>
                        <thead className='thead-dark'>
                        <tr>
                            <th>Назив </th>
                            <th>Тип податка</th>
                        </tr>
                        </thead>
                        <tbody>
                            {metadataList.length ===0 ? 
                            <tr>
                                <td>{metadataList.length}= No projects added!</td>
                            </tr> :
                            metadataList.map((metadata)=> {
                                return (
                                <tr key={metadata._id}>
                                    <td>{metadata.name}</td>
                                    <td>{metadata.type}</td>
                                </tr>
                                )
                            })

                            }
                        </tbody>
                </Table>


        
            <Button variant='info' onClick={sendRequest}>
                        Унеси метаподатак
            </Button>

        <Button style={{marginLeft: "20px"}} variant='info' onClick={() => window.location.replace("/project/resource/" + id)}>
                        Даље
        </Button>
        </Col>

      
    </Container>
    
    </>
  )
}


