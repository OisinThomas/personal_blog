import * as React from "react"
import { cx } from "@/utils"

export const MoonIcon = ({className, ...rest}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...rest}
    className={cx(className)}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeDasharray={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M12 21v1m9-10h1M12 3V2M3 12H2">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.2s"
          values="4;2"
        />
      </path>
      <path d="m18.5 18.5.5.5m-.5-13.5L19 5m-13.5.5L5 5m.5 13.5L5 19">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.2s"
          dur="0.2s"
          values="4;2"
        />
      </path>
    </g>
    <g fill="none" fillOpacity={0}>
      <path d="m15.22 6.03 2.53-1.94L14.56 4 13.5 1l-1.06 3-3.19.09 2.53 1.94-.91 3.06 2.63-1.81 2.63 1.81z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="0.6s;lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+6s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.2s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="M13.61 5.25 15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.2s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="M19.61 12.25 21.25 11l-2.06-.05L18.5 9l-.69 1.95-2.06.05 1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+0.4s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.8s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="m20.828 9.731 1.876-1.439-2.366-.067L19.552 6l-.786 2.225-2.366.067 1.876 1.439L17.601 12l1.951-1.342L21.503 12z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3.4s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.6s"
          dur="0.4s"
          values="1;0"
        />
      </path>
    </g>
    <mask id="a">
      <circle cx={12} cy={12} r={12} fill="#fff" />
      <circle cx={22} cy={2} r={3} fill="#fff">
        <animate
          fill="freeze"
          attributeName="cx"
          begin="0.1s"
          dur="0.4s"
          values="22;18"
        />
        <animate
          fill="freeze"
          attributeName="cy"
          begin="0.1s"
          dur="0.4s"
          values="2;6"
        />
        <animate
          fill="freeze"
          attributeName="r"
          begin="0.1s"
          dur="0.4s"
          values="3;12"
        />
      </circle>
      <circle cx={22} cy={2} r={1}>
        <animate
          fill="freeze"
          attributeName="cx"
          begin="0.1s"
          dur="0.4s"
          values="22;18"
        />
        <animate
          fill="freeze"
          attributeName="cy"
          begin="0.1s"
          dur="0.4s"
          values="2;6"
        />
        <animate
          fill="freeze"
          attributeName="r"
          begin="0.1s"
          dur="0.4s"
          values="1;10"
        />
      </circle>
    </mask>
    <circle cx={12} cy={12} r={6} fill="currentColor" mask="url(#a)">
      <set attributeName="opacity" begin="0.5s" to={0} />
      <animate
        fill="freeze"
        attributeName="r"
        begin="0.1s"
        dur="0.4s"
        values="6;10"
      />
    </circle>
  </svg>
)

export const SunIcon = ({className, ...rest}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...rest}
    className={cx(className)}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeDasharray={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M12 21v1m9-10h1M12 3V2M3 12H2">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.2s"
          values="4;2"
        />
      </path>
      <path d="m18.5 18.5.5.5m-.5-13.5L19 5m-13.5.5L5 5m.5 13.5L5 19">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.2s"
          dur="0.2s"
          values="4;2"
        />
      </path>
    </g>
    <g fill="none" fillOpacity={0}>
      <path d="m15.22 6.03 2.53-1.94L14.56 4 13.5 1l-1.06 3-3.19.09 2.53 1.94-.91 3.06 2.63-1.81 2.63 1.81z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="0.6s;lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+6s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.2s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="M13.61 5.25 15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.2s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="M19.61 12.25 21.25 11l-2.06-.05L18.5 9l-.69 1.95-2.06.05 1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+0.4s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.8s"
          dur="0.4s"
          values="1;0"
        />
      </path>
      <path d="m20.828 9.731 1.876-1.439-2.366-.067L19.552 6l-.786 2.225-2.366.067 1.876 1.439L17.601 12l1.951-1.342L21.503 12z">
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3.4s"
          dur="0.4s"
          values="0;1"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.6s"
          dur="0.4s"
          values="1;0"
        />
      </path>
    </g>
    <mask id="a">
      <circle cx={12} cy={12} r={12} fill="#fff" />
      <circle cx={22} cy={2} r={3} fill="#fff">
        <animate
          fill="freeze"
          attributeName="cx"
          begin="0.1s"
          dur="0.4s"
          values="22;18"
        />
        <animate
          fill="freeze"
          attributeName="cy"
          begin="0.1s"
          dur="0.4s"
          values="2;6"
        />
        <animate
          fill="freeze"
          attributeName="r"
          begin="0.1s"
          dur="0.4s"
          values="3;12"
        />
      </circle>
      <circle cx={22} cy={2} r={1}>
        <animate
          fill="freeze"
          attributeName="cx"
          begin="0.1s"
          dur="0.4s"
          values="22;18"
        />
        <animate
          fill="freeze"
          attributeName="cy"
          begin="0.1s"
          dur="0.4s"
          values="2;6"
        />
        <animate
          fill="freeze"
          attributeName="r"
          begin="0.1s"
          dur="0.4s"
          values="1;10"
        />
      </circle>
    </mask>
    <circle cx={12} cy={12} r={6} fill="currentColor" mask="url(#a)">
      <set attributeName="opacity" begin="0.5s" to={0} />
      <animate
        fill="freeze"
        attributeName="r"
        begin="0.1s"
        dur="0.4s"
        values="6;10"
      />
    </circle>
  </svg>
)


