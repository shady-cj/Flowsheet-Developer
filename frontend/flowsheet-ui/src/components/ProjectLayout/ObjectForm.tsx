
const ObjectForm = () => {
  return (
    <div className="absolute w-full h-full bg-[#00000080] z-10 " onMouseDown={()=> {
        return false
    }}>
        <div className="relative w-full h-full">
            <form action="" className="absolute bg-white top-20 left-20 p-6 flex flex-col gap-y-4">
                <section className="flex gap-2 items-center">
                    <label htmlFor="label" className="text-xl font-bold">Label</label>
                    <input type="text" id="label" className="border border-black p-2"/>
                </section>
                <section className="flex gap-2">
                    <label htmlFor="description" className="text-xl font-bold">Description</label>
                    <textarea rows={4}  id="description" className="border border-black p-2"> </textarea>
                </section>
                <button className="bg-black text-white w-fit px-4 py-2 mx-auto font-bold rounded-md">Save</button>
            </form>
        </div>  
    </div>
  )
}

export default ObjectForm
