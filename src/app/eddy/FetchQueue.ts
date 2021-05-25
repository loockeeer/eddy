import { fetchQueue } from "../database"

export namespace FetchQueue {
  export function add(datasetName: string) {
    if (fetchQueue.has(datasetName)) throw new Error(`Dataset ${datasetName} fetch already in queue !`)

    fetchQueue.set(datasetName, {
      time: Date.now(),
      status: 0
    })

    return fetchQueue.count - 1
  }

  export function exists(datasetName: string) {
    return fetchQueue.has(datasetName)
  }

  export function pop() {
    if (fetchQueue.count === 0) throw new Error('Queue is empty !')

    const queue = Array.from(fetchQueue.entries()).sort((a, b) => a[1].time - b[1].time)
    const toDelete = queue[0]
    fetchQueue.delete(toDelete[0])
    return toDelete[0]
  }

  export function first() {
    if (fetchQueue.count === 0) throw new Error('Queue is empty !')

    return Array.from(fetchQueue.entries()).sort((a, b) => a[1].time - b[1].time)[0][0]
  }

  export function index(datasetName: string) {
    const queue = Array.from(fetchQueue.entries()).sort((a, b) => a[1].time - b[1].time)

    return queue.findIndex(el=>el[0] === datasetName)
  }

  export function length() {
    return fetchQueue.count
  }

  export function setStatus(datasetName: string, status: number) {
    if(!exists(datasetName)) throw new Error(`Dataset ${datasetName} is not in the queue !`)
    fetchQueue.set(datasetName, status, "status")
    return status
  }

  export function getStatus(datasetName: string) {
    const entry = fetchQueue.ensure(datasetName, {time: 0, status: 0})
    return entry.status
  }
}