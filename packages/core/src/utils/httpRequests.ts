export async function get(url: URL | string) {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();

    throw new Error(error || response.status + ' could not get URL ' + url);
  }

  return response;
}

export async function post(url: URL | string, options: RequestInit) {
  options.method = 'POST';

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();

    throw new Error(error || response.status + ' could not post URL ' + url);
  }

  return response;
}
