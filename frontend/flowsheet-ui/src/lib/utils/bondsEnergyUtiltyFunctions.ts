import { singleObjectDataType, objectDataType } from "@/components/context/FlowsheetProvider"
export const validateCommunitionPaths = (communitionList: singleObjectDataType[], objectData: objectDataType): boolean => {
    // Implementing DFS (Depth first search)
    const start = communitionList[0]
    const end = communitionList[1]
    if (start.oid === end.oid) return true
    let current: string= null!
    let queue = [...start.properties.nextObject]
    let visitedNode = new Set()
    visitedNode.add(start.oid)
    
    while (queue.length) {
        current = queue.pop() as string;
        if (visitedNode.has(current)) continue
        visitedNode.add(current)
        if (current === end.oid) return true
        for (const objectId of objectData[current].properties.nextObject) queue.push(objectId)
    }
    return false
}