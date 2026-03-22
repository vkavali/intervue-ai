import Link from "next/link"

type LogoSize = "sm" | "md" | "lg" | "xl"
type LogoVariant = "light" | "dark"

interface LogoProps {
  size?: LogoSize
  variant?: LogoVariant
  href?: string | false
  className?: string
}

const sizeConfig = {
  sm: {
    main: "text-lg",
    sub: "text-[7px]",
    topOffset: "-top-2.5",
    bottomOffset: "-bottom-2.5",
    padding: "my-1.5 mx-2",
  },
  md: {
    main: "text-2xl",
    sub: "text-[9px]",
    topOffset: "-top-3",
    bottomOffset: "-bottom-3",
    padding: "my-2 mx-3",
  },
  lg: {
    main: "text-3xl",
    sub: "text-[10px]",
    topOffset: "-top-3.5",
    bottomOffset: "-bottom-3.5",
    padding: "my-2.5 mx-3",
  },
  xl: {
    main: "text-4xl",
    sub: "text-xs",
    topOffset: "-top-4",
    bottomOffset: "-bottom-4",
    padding: "my-3 mx-4",
  },
}

const variantConfig = {
  light: {
    main: "text-gray-900",
    sub: "text-gray-400",
  },
  dark: {
    main: "text-white",
    sub: "text-gray-500",
  },
}

export default function Logo({ size = "md", variant = "light", href, className = "" }: LogoProps) {
  const s = sizeConfig[size]
  const v = variantConfig[variant]

  const content = (
    <span className={`relative ${s.main} font-bold tracking-tight ${v.main} font-mono ${s.padding} inline-block ${className}`}>
      <span className={`absolute ${s.topOffset} left-0 ${s.sub} font-normal ${v.sub} font-sans leading-none`}>
        the
      </span>
      printf
      <span className="text-saffron">(</span>
      <span className="text-india-green">)</span>
      <span className={`absolute ${s.bottomOffset} right-0 ${s.sub} font-normal ${v.sub} font-sans leading-none`}>
        .com
      </span>
    </span>
  )

  if (href === false) return content

  return (
    <Link href={href || "/"} className="flex items-center">
      {content}
    </Link>
  )
}
