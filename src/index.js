const yargs = require('yargs');
const inquirer = require('inquirer');

const Passwords = require('./db');

(async () => {
  yargs
    .usage('Usage: $0 <command> <masterPassword> [...options]')
    .demandCommand(1)
    .showHelpOnFail(true)
    .help('help', 'Show usage instructions.')
    .command('init', 'Password manager init', async ({ argv }) => {
      const dbExists = Passwords.storeExists();

      if (dbExists) {
        console.warn(
          'Warning: Password manager already initialized. If you continue, all already saved passwords will be lost.'
        );

        const { prompt } = await inquirer.prompt([
          {
            type: 'confirm',
            default: false,
            message: 'Do you want to continue',
            name: 'prompt',
          },
        ]);

        if (!prompt) return;
      }

      const password = argv._[1];

      if (!password) {
        console.error(`Error: Master password not provided.`);

        return;
      }

      const store = new Passwords();

      store.reset();
      store.save(password);

      console.log('Password manager initialized');
    })
    .command('set', 'Set new account-password key', async ({ argv }) => {
      const dbExists = Passwords.storeExists();

      if (!dbExists) {
        console.error(
          `Error: Password manager is not initialized. Run ${argv.$0} init <masterPassword> to initialize.`
        );

        return;
      }

      const password = argv._[1];

      if (!password) {
        console.error(`Error: Master password not provided.`);

        return;
      }

      const account = argv._[2];

      if (!account) {
        console.error(`Error: Account not provided.`);

        return;
      }

      const accountPassword = argv._[3];

      if (!accountPassword) {
        console.error(`Error: Account password not provided.`);

        return;
      }

      const store = new Passwords();

      try {
        store.load(password);
      } catch (e) {
        console.error('Error: Invalid master password.');
      }

      store.add(account, accountPassword);
      store.save(password);

      console.log('Password set for ' + account);
    })
    .command('get', 'Get password for account', async ({ argv }) => {
      const dbExists = Passwords.storeExists();

      if (!dbExists) {
        console.error(
          `Error: Password manager is not initialized. Run ${argv.$0} init <masterPassword> to initialize.`
        );

        return;
      }

      const password = argv._[1];

      if (!password) {
        console.error(`Error: Master password not provided.`);

        return;
      }

      const account = argv._[2];

      if (!account) {
        console.error(`Error: Account not provided.`);

        return;
      }

      const store = new Passwords();

      try {
        store.load(password);
      } catch (e) {
        console.error('Error: Invalid master password.');
      }

      const accountPassword = store.get(account);

      console.log(`Password for ${account} is: ${accountPassword}`);
    }).argv;
})();
