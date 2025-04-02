import React from 'react'
import Showcase from './showcase/showcase'
import { features } from './features/newarrivals'


function NewArrival() {
  return (
    <div>
      <Showcase features={features} title={"NEW ARRIVAL"} toshow={true} />
    </div>
  )
}

export default NewArrival