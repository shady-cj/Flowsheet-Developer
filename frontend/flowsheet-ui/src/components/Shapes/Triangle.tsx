import React from 'react'

const Triangle = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
        <div id={objectId} data-object-name="Triangle" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0049 2.50333L2.12324 19C1.9195 19.3528 1.8117 19.7528 1.81056 20.1603C1.80942 20.5677 1.91497 20.9683 2.11673 21.3223C2.31849 21.6762 2.60942 21.9712 2.96056 22.1778C3.31171 22.3844 3.71083 22.4955 4.11824 22.5H23.8816C24.289 22.4955 24.6881 22.3844 25.0392 22.1778C25.3904 21.9712 25.6813 21.6762 25.8831 21.3223C26.0848 20.9683 26.1904 20.5677 26.1893 20.1603C26.1881 19.7528 26.0803 19.3528 25.8766 19L15.9949 2.50333C15.7869 2.16045 15.4941 1.87697 15.1446 1.68023C14.7952 1.48348 14.4009 1.38013 13.9999 1.38013C13.5989 1.38013 13.2046 1.48348 12.8552 1.68023C12.5057 1.87697 12.2129 2.16045 12.0049 2.50333Z" stroke="#4D4D4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
            </svg>

        </div>
  )
}

export default Triangle
