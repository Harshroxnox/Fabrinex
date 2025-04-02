import React from 'react'
import Showcase from './showcase/showcase'
import FilterDialog from './filter'
import { features } from './features/filtersection'
// import { features } from './features/newarrivals'

function FilteredCloths() {
  return (
    <div className='flex ml-10'>
        <FilterDialog/>
        <div className='ml-10'>

      <Showcase features={features} title={"Filtered Cloths"} toshow={true}/>
        </div>
    </div>
  )
}

export default FilteredCloths
