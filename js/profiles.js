import { GithubUser } from './githubUser.js'

//CLASSE COM A LÓGICA DOS DADOS E SUA ESTRUTURAÇÃO
class Profiles {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@git-fav:')) || []
  }

  save() {
    localStorage.setItem('@git-fav:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const fielteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )
    this.entries = fielteredEntries
    this.update()
    this.save()
  }
}

//CLASSE QUE VAI CRIAR A VISUALIZAÇÃO E EVENTOS NO HTML

export class ProfilesView extends Profiles {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const favoriteButton = this.root.querySelector('#button-favorite')
    favoriteButton.addEventListener('click', () => {
      const { value } = this.root.querySelector('#github-username')
      this.add(value)
    })
  }

  emptyTable() {
    const noFavoritesYet = document.querySelector('.empty-table')
    if (this.entries.length > 0) {
      noFavoritesYet.classList.add('hide')
    } else {
      noFavoritesYet.classList.remove('hide')
    }
  }

  update() {
    this.emptyTable()
    this.removeAllTr()
    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Foto do usuário ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar o usuário?')
        if (isOk) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })
  }
  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img
        src="https://avatars.githubusercontent.com/u/6643122?v=4"
        alt="Foto do usuário"
      />
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>/maykbrito</span>
      </a>
    </td>
    <td class="repositories">160</td>
    <td class="followers">120.000</td>
    <td class="action"><button class="remove">Remover</button></td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
