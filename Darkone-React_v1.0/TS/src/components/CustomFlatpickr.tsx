import 'flatpickr/dist/themes/light.css'
import Flatpickr from 'react-flatpickr'

type FlatpickrProps = {
  className?: string
  value?: Date | [Date, Date]
  options?: any
  placeholder?: string
}

const CustomFlatpickr = ({ className, value, options, placeholder }: FlatpickrProps) => {
  return (
    <>
      <Flatpickr className={className} data-enable-time value={value} options={options} placeholder={placeholder} />
    </>
  )
}

export default CustomFlatpickr
