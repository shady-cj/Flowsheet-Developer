import React from 'react'

const Loader = ({fullScreen = true, offsetHeightClass, color}: {fullScreen?: boolean, offsetHeightClass?: string, color?: string}) => {
  return (
    <div className={`flex justify-center items-center ${fullScreen ? "min-h-screen" : offsetHeightClass} w-full`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-${color || "blue-500"}`}></div>
  </div>
  )
}

export default Loader
