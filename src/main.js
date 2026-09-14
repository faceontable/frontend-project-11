import './style.css'
import { object, string } from 'yup';
import { proxy, subscribe, snapshot } from 'valtio/vanilla'

const initialState = {
  form: {
    url: '',
    valid: true,
    error: null
  }
}

const watchedState = proxy(initialState)

let schema = object({
  url: string().url().required()
})

const form = document.querySelector('form')

form.addEventListener('submit', ((e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log('Form submitted with data:', Object.fromEntries(formData.entries()));
  const url = formData.get('url');
  schema.validate({ url })
    .then(() => {
      watchedState.form.url = url;
      watchedState.form.valid = true;
      watchedState.form.error = null;
    })
    .catch((err) => {
      watchedState.form.valid = false;
      watchedState.form.error = err.errors[0];
      console.error('Validation error:', err.errors);
    });
}))

const renderForm = () => {
  const search = document.querySelector('input')

  if (watchedState.form.valid) {
    search.classList.remove('border-red-500')
    search.classList.add('border-gray-300')
  } else {
    search.classList.remove('border-gray-300')
    search.classList.add('border-red-500')
  }

  const feedback = document.querySelector('.feedback')
  feedback.textContent = watchedState.form.error

  return form
}


subscribe(watchedState.form, renderForm)