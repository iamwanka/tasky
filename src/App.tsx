import './App.css'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@components/ui/card'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Card className="w-full max-w-sm center">
        <CardHeader>
          <CardTitle>
            Subscription & Billing
          </CardTitle>
          <CardDescription>
            Common questions about your account, plans, payments and cancellations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="max-w-lg">
            {items.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.trigger}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value='item-1'>
              <AccordionTrigger>It is accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>It is accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger>It is accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </>
  )
}

const items = [
  {
    value: "notifications",
    trigger: "Notification Settings",
    content:
      "Manage how to receive notifications. You can enable email alerts for updates or push notifications for mobile devices.",
  },
  {
    value: "privacy",
    trigger: "Privacy & Security",
    content:
      "Control your privacy settings and security preferences. Enable two-factor authentication, manage connected devices, review active sessions, and configure data sharing preferences. You can also download your data or delete your account."
  },
  {
    value: "billing",
    trigger: "Billing & Subscription",
    content:
      "View your current plan, payment history, and upcoming invoices. Update your payment method, change your subscription tier, or cancel your subscription"
  }
]

export default App
