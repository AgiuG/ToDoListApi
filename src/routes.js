import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if(!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'É preciso informar um titulo' }),
        )
      }

      if(!description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'É preciso informar uma descrição' }),
        )
      }

      const tasks = ({
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      })

      database.insert('tasks', tasks)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body
      let updateParams

      if (!title && !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'É preciso informa título ou descrição' })
        )
      }

      const [task] = database.select('tasks', { id })

      if(!task){
        return res.writeHead(404).end( JSON.stringify({ message: 'Task inexistente!' }) )
      }

      if(title){
        updateParams = { 
          ...updateParams,
          title 
        }
      }

      if(description){
        updateParams = {
          ...updateParams,
          description
        }
      }

      database.update('tasks', id, { 
        ...updateParams,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if(!task){
        return res.writeHead(404).end( JSON.stringify({ message: 'Task inexistente!' }) )
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if(!task){
        return res.writeHead(404).end( JSON.stringify({ message: 'Task inexistente!' }) )
      }

      database.update('tasks', id, { 
        completed_at: task.completed_at ? null : new Date(),
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  }
]