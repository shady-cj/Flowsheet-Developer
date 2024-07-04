
type errorType = {error: string}
type warningType = {detail: string}
type successType = {success: string}
type stateType = {
    state: {error: string} | {detail: string} | {success: string}
}
const StatusBox = ({ state }: stateType ) => {
  const error = (state as errorType).error
  const warning = (state as warningType).detail
  const success = (state as successType).success
  const messsage = error || warning || success
  console.log(error, warning, success)
  return (
    <div className={`p-2 text-sm rounded-md text-center font-bold ${error ? "bg-[#ff0505] text-white": warning? "bg-[#ffc302] text-black": success?"bg-[#22bb33] text-white": ""}`}>
      {messsage}
    </div>
  )
}

export default StatusBox
