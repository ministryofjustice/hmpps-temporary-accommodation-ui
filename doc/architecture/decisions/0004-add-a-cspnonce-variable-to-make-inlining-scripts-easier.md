# 4. Add a CSPNonce variable to make inlining scripts easier

Date: 2022-08-12

## Status

Accepted

## Context

The Typescript template comes with some best-practice Web Security setups, that prevent
untrusted inline JavaScript from being run in the browser, or scripts / styles from
untrusted sources from being loaded, if, for example a man in the middle attack injects
something into the page.

This works, but makes inlining our own JavaScript difficult, something that is needed
for using the MoJ Design System.

## Decision

After looking at other projects, we've noticed that other teams use the `cspNonce`
approach, see:

https://content-security-policy.com/nonce

We will then generate a `cspNonce` local, that can be injected into templates. This
variable will then be used in our content security policy to allow any code with that
variable added to be run, e.g:

```html
<script nonce="{{ cspNonce}}">
  // Do some inline JS here
</script>
```

## Consequences

This will make inlining our JavaScript easier, while still maintaining security. It
will require future developers to know about the `cspNonce` approach, but hopefully
comments in the code and this ADR will make things clearer. Inline JS also currently
does not work with this approach, and it took a lot of digging to find out why.
