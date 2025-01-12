import  { z } from 'zod';

export const SignupUpdate = z.object({
  username: z.string().min(2), 
  email: z.string().email(),    
  password: z.string().min(6), 
});
export const Signinput = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})
export const Message = z.object({
    content: z.string().min(1, "Content is required"), 
})

export const ProfileCreateUpdate = z.object({
  name: z.string().min(1, "Name is required"), 
  dateOfBirth: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)),
  { message: "Invalid date format" }).transform((date) => (date ? new Date(date) : undefined)), 
  gender: z.string().min(1, "Gender is required"), 
  religion: z.string().min(1, "Religion is required"), 
  location: z.string().min(1, "Location is required"), 
  maritalStatus: z.string().min(1, "Marital Status is required"),
  education: z.string().min(1, "Education is required"),
  occupation: z.string().min(1, "Occupation is required"), 
  photoUrl: z.string().url("Photo URL must be a valid URL").optional(),
});


export type CreateProfileInput = z.infer<typeof ProfileCreateUpdate>;

export type Signinput = z.infer<typeof Signinput>
export type Signupinput =z.infer<typeof SignupUpdate>
export type Message =z.infer<typeof Message>