import { Form, FormField } from "@/components/ui/form";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

export default function ExampleForm() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormField label="Name" htmlFor="name" required>
        <Input id="name" name="name" placeholder="Enter your name" />
      </FormField>

      <FormField label="Category" htmlFor="category">
        <Select id="category" name="category">
          <option value="">Select...</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
        </Select>
      </FormField>

      <FormField label="Description" htmlFor="desc">
        <Textarea id="desc" name="desc" rows={4} placeholder="Write something..." />
      </FormField>

      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  );
}
