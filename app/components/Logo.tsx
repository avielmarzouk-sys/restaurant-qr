type LogoProps = {
  size?: number
  showWordmark?: boolean
  className?: string
  textClassName?: string
}

/**
 * Click2Eat brand mark: a fork & knife on a plate (dining) with a click/tap
 * badge overlapping the corner (ordering from your phone in one click).
 */
export default function Logo({ size = 32, showWordmark = true, className = '', textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo.svg" alt="Click2Eat" width={size} height={size} className="flex-shrink-0" />
      {showWordmark && (
        <span className={`font-bold tracking-tight ${textClassName}`}>
          Click<span className="text-orange-500">2</span>Eat
        </span>
      )}
    </div>
  )
}
