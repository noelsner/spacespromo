import axios from 'axios'
import { createRef, useEffect, useState, useRef } from 'react'
import { ExclamationIcon, PlusIcon, ArrowNarrowLeftIcon } from '@heroicons/react/solid'
// import Tooltip from '@material-ui/core/Tooltip'

const SpeakerSearch = ({ speakers, setSpeakers, numSpeakersError }) => {
  const [handle, setHandle] = useState('')
  const [error, setError] = useState(false)
  const [duplicateError, setDuplicateError] = useState(false)
  const [speakerIds, setSpeakerIds] = useState([])

  const imageRef = useRef(null)

  let speakerImgRefs = {}

  useEffect(() => {
    const idArray = speakers.map((speaker) => speaker.id)
    const isDuplicate = idArray.some((id, index) => idArray.indexOf(id) !== index)
    setDuplicateError(isDuplicate)
    setSpeakerIds(idArray)
    speakers.forEach((speaker) => {
      speakerImgRefs[speaker.id] = createRef()
    })
  }, [speakers])

  useEffect(() => {
    speakers.forEach((speaker) => {
      speakerImgRefs[speaker.id] = createRef()
    })
  }, [])

  useEffect(() => {
    setError(false)
    setDuplicateError(false)
  }, [handle])

  const onHandleChange = (e) => {
    setHandle(e.target.value)
  }

  const handleAttributeChange = (e, id, attribute) => {
    const currentSpeakerIndex = speakers.findIndex((speaker) => speaker.id === id)
    if (currentSpeakerIndex >= 0) {
      setSpeakers((prev) => [
        ...prev.slice(0, currentSpeakerIndex),
        Object.assign({}, prev[currentSpeakerIndex], { [attribute]: e.target.value }),
        ...prev.slice(currentSpeakerIndex + 1),
      ])
    }
  }

  const onTwitterHandleSearch = (e) => {
    e.preventDefault()
    axios
      .get(`/api/twitter_users?handle=${handle}`)
      .then((res) => {
        const user = res.data
        if (user) {
          if (speakerIds.includes(user.id)) {
            setDuplicateError(true)
          } else {
            user.title = ''
            setSpeakers((prev) => [...prev, user])
            setHandle('')
          }
        } else {
          setError(true)
        }
      })
      .catch((err) => console.log(err))
  }

  const deleteSpeaker = (speakerId) => {
    setSpeakers((prev) => prev.filter(({ id }) => id !== speakerId))
  }

  const handleImageUpload = (e, speaker) => {
    const currentSpeakerIndex = speakers.findIndex((s) => s.id === speaker.id)
    if (currentSpeakerIndex >= 0) {
      setSpeakers((prev) => [
        ...prev.slice(0, currentSpeakerIndex),
        Object.assign({}, prev[currentSpeakerIndex], {
          customImage: URL.createObjectURL(e.target.files[0]),
        }),
        ...prev.slice(currentSpeakerIndex + 1),
      ])
    }
  }

  return (
    <>
      <div className="col-span-full">
        <label htmlFor="speakers" className="block text-sm font-medium text-primary-text">
          Speakers
        </label>
        <form onSubmit={onTwitterHandleSearch} className="flex mt-1">
          <div className="relative block w-full rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm focus:text-gray-800">@</span>
            </div>
            <input
              type="text"
              name="speakers"
              id="speakers"
              className="block w-full pl-8 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary-50"
              placeholder=" Twitter handle"
              value={handle}
              onChange={onHandleChange}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-2 ml-3 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Add
          </button>
        </form>
      </div>
      <div className="mb-8 col-span-full">
        {numSpeakersError && (
          <div className="p-4 mb-4 bg-red-100 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="ml-3 text-sm font-medium text-red-800">
                You have exceeded the maximum number of speakers for this layout.
              </h3>
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 mb-4 bg-red-100 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="ml-3 text-sm font-medium text-red-800">Speaker not found</h3>
            </div>
          </div>
        )}
        {duplicateError && (
          <div className="p-4 mb-4 bg-red-100 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="ml-3 text-sm font-medium text-red-800">Speaker already exists</h3>
            </div>
          </div>
        )}
        <ul className="list-reset list-unstyled list-inline list-inline-icon-left">
          {speakers.map((speaker) => (
            <li key={speaker.id} className="flex items-center w-full py-3 border-t border-gray-300">
              <div className="flex flex-col flex-1">
                <span className="mb-2 font-semibold text-gray-500">@{speaker.username}</span>
                <div className="flex flex-col sm:flex-row ">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="flex relative items-end mt-auto mr-3 w-[38px] h-[38px] rounded-full border border-gray-300 group bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <img
                        className="absolute top-0 left-0 w-full h-full rounded-full"
                        src={speaker.customImage ? speaker.customImage : speaker.profile_image_url}
                        alt=""
                      />
                      <label
                        htmlFor={`custom-image-${speaker.username}`}
                        className="absolute top-0 left-0 flex items-center justify-center w-full h-full transition-opacity bg-white rounded-full opacity-0 cursor-pointer group-hover:opacity-100 focus-within:opacity-100"
                      >
                        <PlusIcon className="w-6 h-6 text-primary-text" />
                        <input
                          type="file"
                          id={`custom-image-${speaker.username}`}
                          name={`custom-image-${speaker.username}`}
                          ref={imageRef}
                          onChange={(e) => handleImageUpload(e, speaker)}
                          className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute z-[-1]"
                        />
                      </label>
                    </div>
                    <span className="flex items-center text-sm text-gray-400 sm:hidden">
                      <ArrowNarrowLeftIcon className="w-5 h-5 mr-1" />
                      Tap to upload custom image
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor={`${speaker.username}-name`}
                      className="block ml-1 text-sm font-medium text-primary-text"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name={`${speaker.username}-name`}
                      id={`${speaker.username}-name`}
                      value={speaker.name}
                      onChange={(e) => handleAttributeChange(e, speaker.id, 'name')}
                      className={`block w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary-50 ${
                        speaker.name.length > 32
                          ? 'border-2 border-orange-600 focus:border-orange-600'
                          : ''
                      }`}
                    />
                    {speaker.name.length > 32 && (
                      <div className="ml-1 text-sm text-orange-600">Long names may get cut off</div>
                    )}
                  </div>
                  <div className="flex-1 mt-2 sm:mt-0 sm:ml-3">
                    <label
                      htmlFor={`${speaker.username}-title`}
                      className="block ml-1 text-sm font-medium text-primary-text"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      name={`${speaker.username}-title`}
                      id={`${speaker.username}-title`}
                      value={speaker.title}
                      onChange={(e) => handleAttributeChange(e, speaker.id, 'title')}
                      className={`block w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary-50 ${
                        speaker.title.length > 55
                          ? 'border-2 border-orange-600 focus:border-orange-600'
                          : ''
                      }`}
                    />
                    {speaker.title.length > 55 && (
                      <div className="ml-1 text-sm text-orange-600">
                        Long titles may get cut off
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="ml-6">
                <button
                  className="font-mono font-semibold text-gray-900 hover:text-red-700"
                  onClick={() => deleteSpeaker(speaker.id)}
                  aria-label="Delete speaker"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default SpeakerSearch
