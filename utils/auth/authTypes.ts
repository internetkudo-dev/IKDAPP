
export interface SignupFormData {
    email: string;
    // add other fields
}

export const getRegisterFields = (t?: any) => [
    { name: 'firstName', placeholder: 'First Name', keyboardType: 'default' as const },
    { name: 'lastName', placeholder: 'Last Name', keyboardType: 'default' as const },
    { name: 'email', placeholder: 'Email', keyboardType: 'email-address' as const },
    { name: 'phoneNumber', placeholder: 'Phone Number', keyboardType: 'phone-pad' as const },
    { name: 'password', placeholder: 'Password', secureTextEntry: true },
    { name: 'confirmPassword', placeholder: 'Confirm Password', secureTextEntry: true },
];
