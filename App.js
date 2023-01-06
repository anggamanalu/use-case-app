/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTea, deleteTea, updateTea } from './graphql/mutations'
import { listTeas } from './graphql/queries'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', bags: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [teas, setTeas] = useState([])

  useEffect(() => {
    fetchTeas()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTeas() {
    try {
      const teaData = await API.graphql(graphqlOperation(listTeas))
      const teas = teaData.data.listTeas.items
      
      setTeas(teas)
    } catch (err) { console.log('error fetching teas') }
  }

  async function addTea() {
    try {
      if (!formState.name || !formState.bags) return
      
      const tea = { ...formState }
      
      setTeas([...teas, tea])
      setFormState(initialState)
      
      await API.graphql(graphqlOperation(createTea, {input: tea}))
      
      fetchTeas()
    } catch (err) {
      console.log('error creating tea:', err)
    }
  }

  async function removeTea(index) {
    try {
      if (teas.length > index) {
        const teaId = {id: teas[index].id}
        
        teas.splice(index, 1)
        setTeas([...teas])
        
        await API.graphql(graphqlOperation(deleteTea, {input: teaId}))
      }
    } catch (err) {
      console.log('error deleting tea:', err)
    }
  }

  async function drinkTea(index) {
    try {
      if (teas.length > index) {
        let tea = teas[index]
        const newCount = parseInt(tea.bags) - 1

        if (newCount <= 0) {
          teas.splice(index, 1)
          setTeas([...teas])

          await API.graphql(graphqlOperation(deleteTea, {input: {id: tea.id}}))
        } else {
          tea.bags = newCount
          teas.splice(index, 1, tea)

          tea = {
            id: tea.id,
            name: tea.name,
            bags: tea.bags
          }

          setTeas([...teas])
            
          await API.graphql(graphqlOperation(updateTea, {input: tea}))
        }
      }
    } catch (err) {
      console.log('error drinking tea:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Tea Management App 🌿</h2>
      <div style={styles.inputContainer}>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        type="number"
        onChange={event => setInput('bags', event.target.value)}
        style={styles.input}
        value={formState.bags}
        placeholder="# of bags"
      />
      </div>
      <button style={styles.button} onClick={addTea}>+ Add Tea</button>
      <div style={styles.teaContainer}>
        <h4>Currently Available Tea</h4>
        {
          teas.map((tea, index) => (
            <div key={tea.id ? tea.id : index} style={styles.tea}>
              <div>
                <p style={styles.teaName}>{tea.name}</p>
                <p style={styles.teaBags}>{tea.bags} Bags</p>
              </div>
              <div>
                <button style={styles.drinkButton} onClick={() => drinkTea(index)}>Drink</button>
                <button style={styles.deleteButton} onClick={() => removeTea(index)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  inputContainer: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%'},
  input: { boxSizing: 'border-box', borderRadius: 5, maxWidth: 195, border: 'none', backgroundColor: '#efefef', marginBottom: 10, padding: 8, fontSize: 18 },
  teaContainer: {marginTop: 25},
  tea: {  marginBottom: 10, marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  teaName: { fontSize: 20, fontWeight: 'bold', marginTop: 0, marginBottom: 10 },
  teaBags: { marginBottom: 0, marginTop: 0, color: '#666', fontStyle: 'italic' },
  button: { backgroundColor: '#27ae60', border: 'none', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px', borderRadius: 5, cursor: 'pointer'},
  drinkButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 5, fontSize: 14, height: 30, cursor: 'pointer', marginRight: 5},
  deleteButton: { backgroundColor: '#e76558', color: 'white', border: 'none', borderRadius: 5, fontSize: 14, height: 30, cursor: 'pointer'},
}

export default App