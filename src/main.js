import './style.css'
import { object, string } from 'yup';

const state = {
  form: {
    url: ''
  }
}

let schema = object({
  url: string().url().required()
})

const renderSearchForm = () => {
  const form = document.querySelector('form')

  const search = document.querySelector('input')
  form.appendChild(search)

  const button = document.querySelector('button')
  button.textContent = 'Добавить'
  form.appendChild(button)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const url = formData.get('url')
    schema.validate({ url })
      .then(() => {
        state.form.url = url;
        console.log('Valid URL:', state.form.url);
      })
      .catch((err) => {
        console.error('Validation error:', err.errors);
      });
  })

  return form
}

document.querySelector('#app').append(renderSearchForm())