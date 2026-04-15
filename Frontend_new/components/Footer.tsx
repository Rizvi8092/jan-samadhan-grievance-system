import type React from "react"
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline"

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
            <div className="flex items-center mb-2">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              <span>perweensana06@gmail.com</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2" />
              <span>8092070768</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end mb-2">
              <span>&copy; 2026</span>
            </div>
            <div>
              <p className="font-semibold">Created by</p>
              <div className="flex flex-wrap justify-center md:justify-end mt-2">
                {[
                  "Sana Praween",
                  "Md Rizwan"
                ].map((name, index) => (
                  <span key={index} className="mx-2">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

