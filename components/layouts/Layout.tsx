import { AppShell } from "@mantine/core"
import MixJuiceHeader from "./MixJuiceHeader"
import MixJuiceNavbar from "./MixJuiceNavbar"

type Props = {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <AppShell
      header={<MixJuiceHeader />}
      navbar={<MixJuiceNavbar />}
      navbarOffsetBreakpoint="sm"
      styles={{
        main: {
          height: "100vh",
          margin: "-1rem -1rem auto -1rem"
        }
      }}
    >
      {children}
    </AppShell>
  )
}

export default Layout
