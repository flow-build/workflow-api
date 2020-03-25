# Contributing to flow-build/workflow

We'd love for you to contribute to our source code and to flowbuild-workflow even better than it is
today!

Check out the Developer's Guide on the [documentation](https://flow-build.github.io/#/) for setup instructions.

Here are the guidelines we'd like you to follow:

- [Question or Problem?](#question)
- [Issues and Bugs](#issue)
- [Submission Guidelines](#submit)
- [Coding Format](#format)

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to contribute or use to flow-build, please join our [![Gitter](https://badges.gitter.im/flow-build/flow-build.svg)](https://gitter.im/flow-build/flow-build?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) page.

## <a name="issue"></a> Found an Issue?

If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [GitHub Repository][github]. Even better you can submit a Pull Request
with a fix.

**Please see the [Submission Guidelines](#submit) below.**

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug and hasn't been reported, open a new issue. Help us to maximize
the effort we can spend fixing issues and adding new features, by not reporting duplicate issues.
Providing the following information will increase the chances of your issue being dealt with
quickly:

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

- Search [GitHub](https://github.com/flow-build/workflow/pulls) for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.
- [Fork](https://help.github.com/articles/fork-a-repo/) this repo.
- [Clone](https://help.github.com/articles/cloning-a-repository/) your copy.

```shell
git clone https://github.com/YOUR_USERNAME/workflow.git -o flow-build-workflow
cd flow-build-workflow/
```

- After cloning, set a new remote [upstream](https://help.github.com/articles/configuring-a-remote-for-a-fork/) (this helps to keep your fork up to date)

```shell
git remote add upstream https://github.com/flow-build/workflow.git
```

- Make your changes in a new git branch:

```shell
git checkout -b my-fix-branch master
```

see [branch name pattern](https://github.com/flow-build/flow-build/wiki/Branch-Pattern) to help us for better identification.

- Create your patch and run appropriate tests.
- Follow our [Coding Format](#format).
- Commit your changes using a descriptive commit message that uses the imperative, present tense: "change" not "changed" nor "changes".

```shell
git commit -a
```

Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

- Push your branch to GitHub:

```shell
git push origin my-fix-branch
```

In GitHub, send a pull request to `workflow:master`.
If we suggest changes, then:

- Make the required updates.
- Re-run flow-build/workflow and make sure any and all tests are still passing.
- Commit your changes to your branch (e.g. `my-fix-branch`).
- Push the changes to your GitHub repository (this will update your Pull Request).

If the PR gets too outdated we may ask you to rebase and force push to update the PR:

```shell
git fetch upstream
git rebase upstream/master
git push origin my-fix-branch -f
```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

- Check out the master branch:

    ```shell
    git checkout master -f
    ```

- Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

- Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```

## <a name="format"></a> Coding Format

To ensure consistency throughout the source code, review our [code conventions](https://github.com/flow-build/flow-build/wiki/Branch-Pattern).


[github]: https://github.com/flow-build/flow=build
