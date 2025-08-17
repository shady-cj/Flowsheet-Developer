"use client";
import Link from "next/link"
import { logout } from "@/lib/actions/auth"
import { MouseEvent, useState, useContext, ChangeEvent, useRef, FormEvent, useEffect } from "react";
import Logo from "../Logo";
import logoIcon from "@/assets/logo-icon-2.svg"
import searchIcon from "@/assets/search-project.svg"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
import arrowRight from "@/assets/arrow-right.svg";
import cancel from "@/assets/cancel.svg"
import addPhoto from "@/assets/add-photo.png"
import Image from "next/image";
import { UserContext } from "../context/UserProvider";
import { dashboardSearch, sendFeedback } from "@/lib/actions/dashboard";
import { fetchedFlowsheetsType, fetchedProjectType } from "./DashboardPageRenderer";
import Loader from "../utils/loader";
import Button from "../utils/Button";
import ShortUniqueId from "short-unique-id";
const MAXFILESIZE = 5000000; // 5 mb


const DashboardHeader = () => {
  const [showDropDown, setShowDropDown] = useState(false)
  const feedbackScreenshotsFileSize = useRef(0)
  const descriptionRef = useRef<HTMLTextAreaElement>(null!)
  const dropArea = useRef<HTMLLabelElement>(null!)
  const [sendingFeedbacks, setSendingFeedbacks] = useState(false)
  const {user, loadingUser} = useContext(UserContext)
  const [files, setFiles] = useState<{id: string, file: File}[] | []>([])
  const [previews, setPreviews] = useState<{id: string, preview: (ArrayBuffer | string | null)}[]>([])
  
  const [searchResult, setSearchResult] = useState<null | {projects: fetchedProjectType[], flowsheets: fetchedFlowsheetsType[]}>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const Logout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout()

  }
  const handleSearchInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim()
    if (query.length < 3) {
      setSearchResult(null)
      return
    }
    setSearchResult(await dashboardSearch(query))
    
  }
  const handleFeedbackClick = () => {
    setShowDropDown(false)
    setShowFeedbackForm(true)
  }
  const submitFeedback = async () => {
    const formData = new FormData()
    if (descriptionRef.current.value.length === 0)
        return
    setSendingFeedbacks(true)
    formData.append('description', descriptionRef.current.value)
    
    files.forEach(file=> {
      formData.append('screenshots', file.file)

    })

    const result = await sendFeedback(formData)
    alert(result.message)
    setSendingFeedbacks(false)
    setTimeout(()=> {
      setShowFeedbackForm(false)
      setPreviews([])
      setFiles([])
      feedbackScreenshotsFileSize.current = 0
    }, 1000)
   
  }
  const handleFile = async (files: {id: string, file: File}[]) => {
        for (const file of files) {

          const reader = new FileReader()

          reader.readAsDataURL(file.file)
          reader.onloadend = () => {
              setPreviews(prev => [...prev, {id: file.id, preview: reader.result}])
          }
        }
    }
  const handleFileChange = (e: FormEvent<HTMLInputElement>) => {
      
      let remainingLength = 5 - files.length
      if (remainingLength === 0) {
        alert("You can't add more than 5 images")
        return
      }

      const { randomUUID } = new ShortUniqueId({ length: 10 });

      const inputFiles = (e.target as HTMLInputElement).files as FileList

      const newFiles: {id: string, file: File}[]  = []
      for (const inputFile of inputFiles) {
        if (feedbackScreenshotsFileSize.current + inputFile.size < MAXFILESIZE) {
          feedbackScreenshotsFileSize.current += inputFile.size
        } else {
          alert("Maximum file size of 5MB exceeded")
          break
        }
      
        if (remainingLength > 0) newFiles.push({id: randomUUID(), file: inputFile})
        else break
        remainingLength--
        
      }
      setFiles(prevFiles => [...prevFiles, ...newFiles])
      
      handleFile(newFiles)
      
    }
  const handleFileRemove = (index: string) => {

    const updatedFiles = files.filter((file) => {
      if (file.id === index)
        feedbackScreenshotsFileSize.current -= file.file.size
      return file.id !== index
  })
    const updatedPreviews = previews.filter(preview=> preview.id !== index)

    setFiles(updatedFiles)
    setPreviews(updatedPreviews)

  }

  useEffect(()=> {
    if (showFeedbackForm) {
      setFiles([])
      setPreviews([])
      feedbackScreenshotsFileSize.current = 0
      descriptionRef.current.value = ''
    }
  }, [showFeedbackForm])
  return (
    <>
    <header className="w-full sticky bg-grayVariant border-b border-[#DFE1E6] top-0 z-30 flex-initial text-white" id="dashboard-header">
        <div className="flex py-4 px-8 w-full">
            <Logo logoIcon={logoIcon}/>
            <div className="relative py-2 px-4 flex items-center gap-2 border border-[#B3B3B3] rounded-lg ml-auto">
              <Image src={searchIcon} width={20} height={20} alt="search icon" />
              <input type="text" placeholder="Search project or flowsheet" className="bg-transparent text-sm font-normal text-[#666666] focus:outline-none" onChange={handleSearchInput}/>
              {
                searchResult ? (
                  <div className='absolute shadow-sm w-[25vw] min-h-[20vh] left-0 top-[150%] z-20 bg-white text-black rounded-xl px-4 py-6'>
                    <h2 className='text-xl font-semibold mb-2'>Search Results</h2> 
                    <hr />

                    {
                      searchResult.projects && searchResult.projects.length ? (
                        <section className="py-2 px-3">
                          <h3 className='text-lg font-semibold'>
                            Projects
                          </h3>
                          <article className='pt-4 pb-2 flex flex-col gap-3'> 
                          {
                                searchResult.projects.map(project => <Link key={project.id} href={`/${project.link}`} className='w-[80%] text-text-black-2 font-medium flex justify-between px-4'>
                                {project.name}
                                <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                                
                                </Link> 
                                )
                            }
      
                          </article>
                        </section>

                      ) : ""
                      
                    }
                    {
                      (searchResult.projects && searchResult.projects.length && searchResult.flowsheets && searchResult.flowsheets.length) ? <hr /> : ""
                    }
                    {
                      searchResult.flowsheets && searchResult.flowsheets.length ? (
                        <section className="py-2 px-3">
                          <h3 className='text-lg font-semibold'>
                            Flowsheet
                          </h3>
                          <article className='pt-4 pb-2 flex flex-col gap-3'> 
                          {
                                searchResult.flowsheets.map(flowsheet => <Link key={flowsheet.id} href={`/${flowsheet.link}`} className='w-[80%] text-text-black-2 font-medium flex justify-between px-4'>
                                {flowsheet.name}
                                <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                                
                                </Link> 
                                )
                            }
      
                          </article>
                        </section>

                      ) : ""
                      
                    }
                    
                  </div>
                ): ""
              }
              
            </div>
            <nav className="flex items-center pl-4 gap-x-2 ml-auto">
              {
                loadingUser ?
                <div>
                  <Loader fullScreen={false}  color="black"  small/>
                </div> : 
                user ? <>
                  <div className="bg-[#E381E3] font-semibold text-[#261A26] text-base w-10 h-10 border border-[#CC74CC] flex items-center justify-center rounded-full" style={{boxShadow: "0px -4px 5px -2px #0000000D inset"}}>
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="text-base font-normal text-black">
                    {user?.email}
                  </p>
                </> : ""
              }
              
              <div className="relative">
                <Image src={showDropDown? arrowUp : arrowDown} width={10} height={10} alt="arrow Down" className="cursor-pointer" onClick={() => setShowDropDown((prev)=> !prev)}/>
                <div className={`z-10 p-4 absolute shadow-sm rounded-md flex-col bg-white transition-all top-[400%] -left-[1200%] ${showDropDown ? "opacity-100 visible" : "invisible opacity-0"}`}>
                  <button className="text-black py-2 px-4 font-bold hover:text-[rgba(0,0,0,0.6)]" onClick={Logout}>Logout</button>
                  <button className="text-black py-2 px-4 font-bold hover:text-[rgba(0,0,0,0.6)]" onClick={handleFeedbackClick}>Feedback</button>
                </div>
              </div>
                
            </nav>
        </div>
        
    </header>
    <div className={`transition-all w-screen h-screen left-0 top-0 fixed bg-[#00000080] z-50 flex justify-center items-center ${showFeedbackForm ? "visible opacity-100": "invisible opacity-0"}`}>
    
        <div className="w-1/2 h-3/4 bg-white rounded-md shadow-lg relative">
              {/* hello */}
            <Image src={cancel} width={30} alt="cancel" className="absolute cursor-pointer top-8 right-10" onClick={()=> setShowFeedbackForm(false)}/>
             <div className="flex flex-col p-8 justify-between items-center h-full">
                <h1 className="text-2xl mt-4 font-bold text-center">
                FEEDBACK FORM
              </h1>
              {
                  previews.length ? <div className="w-2/3 justify-center flex items-center gap-2">
                    {
                      previews.map(p => {
                        const {preview, id} = p
                        if (p)
                          return <div key={id} className="relative h-[60px] p-2">
                            <Image src={preview as string} width={40} height={40} className='h-full w-auto' alt="preview"/>
                            <Image src={cancel} width={16} className="absolute top-[100%] left-[50%] -translate-x-[50%] cursor-pointer" alt="cancel" onClick={() => handleFileRemove(id)}/>
                          </div>
                      })
                    }
                    <label htmlFor="feedback-screenshot">
                      <Image src={addPhoto} width={24} height={24} alt="add photo" className="cursor-pointer"/>
                    </label>
                  </div> :
                  <div className="w-2/3 flex justify-center">
                      <label 
                      htmlFor="feedback-screenshot" 
                      className="flex gap-4 items-center font-bold cursor-pointer">
                        Add Screenshots

                        <Image src={addPhoto} width={24} height={24} alt="add photo"/>
                      </label>
                  </div>

              }
              
                <input type="file" accept="image/jpeg, image/jpg, image/png" id="feedback-screenshot"  multiple hidden onChange={handleFileChange}/>
                <textarea name="feedback" id="feedback-form"  rows={8} cols={4} ref={descriptionRef} className="w-2/3 min-h-[10rem] bg-gray-100 p-4 border border-gray-200 rounded-md" placeholder="Write your feedback, issues and complaints here"></textarea>
                <div className="flex justify-center w-2/3">

                  <Button title={sendingFeedbacks ? "Sending Feedbacks..." : "Send Feedback"} onClick={submitFeedback} disabled={sendingFeedbacks}/>
                </div>
              </div>
             
        </div>
              
    </div>
    
    </>
  )
}

export default DashboardHeader